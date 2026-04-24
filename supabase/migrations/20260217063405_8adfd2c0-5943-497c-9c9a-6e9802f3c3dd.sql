
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('rider', 'driver', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create vehicles table for drivers
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create rides table
CREATE TABLE public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES auth.users(id) NOT NULL,
  driver_id UUID REFERENCES auth.users(id),
  pickup_location TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  destination TEXT NOT NULL,
  dest_lat DOUBLE PRECISION,
  dest_lng DOUBLE PRECISION,
  distance_km DOUBLE PRECISION,
  base_fare DOUBLE PRECISION NOT NULL DEFAULT 30,
  time_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  weather_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  final_fare DOUBLE PRECISION,
  weather_condition TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  otp_code TEXT,
  rating INTEGER,
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pricing_config table for admin
CREATE TABLE public.pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_fare DOUBLE PRECISION NOT NULL DEFAULT 30,
  rate_per_km DOUBLE PRECISION NOT NULL DEFAULT 12,
  night_multiplier DOUBLE PRECISION NOT NULL DEFAULT 2.0,
  evening_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.2,
  rain_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.3,
  storm_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default pricing config
INSERT INTO public.pricing_config (base_fare, rate_per_km) VALUES (30, 12);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role on signup" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Vehicles policies
CREATE POLICY "Drivers can view own vehicles" ON public.vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can insert own vehicles" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Drivers can update own vehicles" ON public.vehicles FOR UPDATE USING (auth.uid() = user_id);

-- Rides policies
CREATE POLICY "Riders can view own rides" ON public.rides FOR SELECT USING (auth.uid() = rider_id);
CREATE POLICY "Drivers can view assigned rides" ON public.rides FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "Riders can create rides" ON public.rides FOR INSERT WITH CHECK (auth.uid() = rider_id);
CREATE POLICY "Drivers can update rides they accepted" ON public.rides FOR UPDATE USING (auth.uid() = driver_id);
CREATE POLICY "Riders can update own rides" ON public.rides FOR UPDATE USING (auth.uid() = rider_id);
CREATE POLICY "Drivers can view requested rides" ON public.rides FOR SELECT TO authenticated USING (status = 'requested' AND public.has_role(auth.uid(), 'driver'));
CREATE POLICY "Admins can view all rides" ON public.rides FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Pricing config policies
CREATE POLICY "Anyone can read pricing config" ON public.pricing_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update pricing" ON public.pricing_config FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON public.rides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for rides
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
