import { supabase } from "@/integrations/supabase/client";

/**
 * Test credentials for development
 * Use these to login during development
 */
export const TEST_CREDENTIALS = {
  rider: {
    email: "rider@test.com",
    password: "Test123456",
  },
  driver: {
    email: "driver@test.com",
    password: "Test123456",
  },
};

/**
 * Creates test users in Supabase
 * Run this once to set up test accounts
 */
export async function seedTestUsers() {
  try {
    console.log("Creating test users...");

    // Create rider account
    const riderResult = await supabase.auth.signUp({
      email: TEST_CREDENTIALS.rider.email,
      password: TEST_CREDENTIALS.rider.password,
      options: {
        data: { full_name: "Test Rider" },
      },
    });

    if (riderResult.data.user) {
      await supabase.from("user_roles").insert({
        user_id: riderResult.data.user.id,
        role: "rider",
      });
      console.log("✓ Rider account created");
    }

    // Create driver account
    const driverResult = await supabase.auth.signUp({
      email: TEST_CREDENTIALS.driver.email,
      password: TEST_CREDENTIALS.driver.password,
      options: {
        data: { full_name: "Test Driver" },
      },
    });

    if (driverResult.data.user) {
      await supabase.from("user_roles").insert({
        user_id: driverResult.data.user.id,
        role: "driver",
      });

      // Add vehicle for driver
      await supabase.from("vehicles").insert({
        user_id: driverResult.data.user.id,
        vehicle_type: "Auto",
        vehicle_model: "Bajaj Auto",
        vehicle_number: "DL01AB1234",
      });
      console.log("✓ Driver account created");
    }

    console.log("Test users created successfully!");
    console.log("You can now login with:");
    console.log(`Rider - Email: ${TEST_CREDENTIALS.rider.email}, Password: ${TEST_CREDENTIALS.rider.password}`);
    console.log(`Driver - Email: ${TEST_CREDENTIALS.driver.email}, Password: ${TEST_CREDENTIALS.driver.password}`);
  } catch (error: any) {
    console.error("Error creating test users:", error.message);
  }
}
