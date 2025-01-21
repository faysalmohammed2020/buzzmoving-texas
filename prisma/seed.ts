import { db } from "../lib/db";
import { postdata } from "../app/data/postdata";

async function main() {
  const postCount = await db.blogPost.count();

  if (!postCount) {
    const formattedPosts = postdata.map((post) => ({
      post_author: Number(post.post_author),
      name: post.name || "Unnamed Post",
      category:
        typeof post.category === "object" ? post.category.name : post.category, // Convert category to string
      post_date: new Date(post.post_date),
      post_date_gmt: new Date(post.post_date_gmt),
      post_content: post.post_content, // ✅ Use Prisma schema field name
      post_title: post.post_title, // ✅ Use Prisma schema field name
      tags: "", // Set empty string or modify as needed
      post_excerpt: post.post_excerpt || "",
      post_status: post.post_status,
      comment_status: post.comment_status,
      ping_status: post.ping_status,
      post_password: post.post_password || "",
      post_name: post.post_name,
      to_ping: post.to_ping || "",
      pinged: post.pinged || "",
      post_modified: new Date(post.post_modified),
      post_modified_gmt: new Date(post.post_modified_gmt),
      post_content_filtered: post.post_content_filtered || "",
      post_parent: Number(post.post_parent),
      guid: post.guid,
      menu_order: Number(post.menu_order),
      post_type: post.post_type,
      post_mime_type: post.post_mime_type || "",
      comment_count: Number(post.comment_count),
      createdAt: new Date(), // Ensure Prisma default works correctly
    }));

    await db.blogPost.createMany({
      data: formattedPosts,
      skipDuplicates: true, // Avoid duplicate inserts
    });

    console.log("✅ Post seeding successful!");
  } else {
    console.log("✅ Posts already exist. Skipping seeding.");
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error(" Error seeding database:", error);
    await db.$disconnect();
    process.exit(1);
  });
