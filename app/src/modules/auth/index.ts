import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";
import { env } from "../../config/env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on("connect", (client) => {
  client.query("SET search_path TO auth, public");
});

export const auth = betterAuth({
  database: pool,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.VITE_BUNVEL_STUDIO_URL ? [env.VITE_BUNVEL_STUDIO_URL] : [],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Make the first user an admin automatically
          const res = await pool.query('SELECT COUNT(*) FROM auth."user"');
          const count = parseInt(res.rows[0].count);
          
          if (count === 0) {
            return {
              data: {
                ...user,
                role: "admin",
              },
            };
          }

          // Otherwise use ADMIN_EMAIL if set
          if (
            env.ADMIN_EMAIL &&
            user.email === env.ADMIN_EMAIL
          ) {
            return {
              data: {
                ...user,
                role: "admin",
              },
            };
          }
          return { data: user };
        },
      },
    },
  },
});
