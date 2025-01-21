// import { PrismaClient } from "@prisma/client";
// import { postdata, PostData } from "../app/data/postdata";

// const prisma = new PrismaClient();

// <<<<<<< HEAD
// async function main() {
//   console.log("🌱 Seeding Blog Posts...");

//   // Check if posts already exist
//   const existingPosts = await prisma.blogPost.count();
//   if (existingPosts > 0) {
//     console.log("✅ Blog posts already exist. Skipping seeding.");
//     return;
// =======
// // async function main() {
// //   const postCount = await db.blogPost.count();

// //   if (!postCount) {
// //     const formattedPosts = postdata.map((post) => ({
// //       post_author: Number(post.post_author),
// //       name: post.name || "Unnamed Post",
// //       category:
// //         typeof post.category === "object" ? post.category.name : post.category, // Convert category to string
// //       post_date: new Date(post.post_date),
// //       post_date_gmt: new Date(post.post_date_gmt),
// //       post_content: post.post_content, // ✅ Use Prisma schema field name
// //       post_title: post.post_title, // ✅ Use Prisma schema field name
// //       tags: "", // Set empty string or modify as needed
// //       post_excerpt: post.post_excerpt || "",
// //       post_status: post.post_status,
// //       comment_status: post.comment_status,
// //       ping_status: post.ping_status,
// //       post_password: post.post_password || "",
// //       post_name: post.post_name,
// //       to_ping: post.to_ping || "",
// //       pinged: post.pinged || "",
// //       post_modified: new Date(post.post_modified),
// //       post_modified_gmt: new Date(post.post_modified_gmt),
// //       post_content_filtered: post.post_content_filtered || "",
// //       post_parent: Number(post.post_parent),
// //       guid: post.guid,
// //       menu_order: Number(post.menu_order),
// //       post_type: post.post_type,
// //       post_mime_type: post.post_mime_type || "",
// //       comment_count: Number(post.comment_count),
// //       createdAt: new Date(), // Ensure Prisma default works correctly
// //     }));

// //     await db.blogPost.createMany({
// //       data: formattedPosts,
// //       skipDuplicates: true, // Avoid duplicate inserts
// //     });

//     console.log("✅ Post seeding successful!");
//   } else {
//     console.log("✅ Posts already exist. Skipping seeding.");
// >>>>>>> 0fed351b59033d66660dc26f8e3a3ca11cbc8ba8
//   }

//   // Format and insert posts
//   const formattedPosts = postdata.map((post) => ({
//     post_author: post.post_author ? Number(post.post_author) : null,
//     name: post.name || "Unnamed Post",
//     category:
//       typeof post.category === "object" && post.category?.name
//         ? post.category.name
//         : String(post.category),
//     post_date: post.post_date ? new Date(post.post_date) : new Date(),
//     post_date_gmt: post.post_date_gmt ? new Date(post.post_date_gmt) : new Date(),
//     post_content: { text: post.post_content || "No content provided." }, // JSON format
//     post_title: post.post_title || "Untitled",
//     post_excerpt: post.post_excerpt || "",
//     post_status: post.post_status || "draft",
//     comment_status: post.comment_status || "open",
//     ping_status: post.ping_status || "closed",
//     post_password: post.post_password || "",
//     post_name: post.post_name || "",
//     to_ping: post.to_ping || "",
//     pinged: post.pinged || "",
//     post_modified: post.post_modified ? new Date(post.post_modified) : new Date(),
//     post_modified_gmt: post.post_modified_gmt ? new Date(post.post_modified_gmt) : new Date(),
//     post_content_filtered: post.post_content_filtered || "",
//     post_parent: post.post_parent ? Number(post.post_parent) : null,
//     guid: post.guid || "",
//     menu_order: post.menu_order ? Number(post.menu_order) : 0,
//     post_type: post.post_type || "post",
//     post_mime_type: post.post_mime_type || "",
//     comment_count: post.comment_count ? Number(post.comment_count) : 0,
//     createdAt: new Date(),
//   }));

//   // Insert posts into the database
//   await prisma.blogPost.createMany({
//     data: formattedPosts,
//     skipDuplicates: true, // Prevents duplicate entries
//   });

//   console.log("✅ Blog posts seeded successfully!");
// }

// // Run the seed function
// main()
//   .catch((error) => {
//     console.error("Error seeding database:", error);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
