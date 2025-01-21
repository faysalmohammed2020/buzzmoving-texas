import prisma from "@/prisma/prisma";

export async function GET(req: Request) {
  try {
    const blogPosts = await prisma.blogPost.findMany({
      select: {
        id: true,
        post_title: true,
        post_content: true,
        category: true,
        tags: true,
        createdAt: true,
      },
    });

    return new Response(JSON.stringify(blogPosts), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    return new Response("Failed to fetch blog posts", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newPost = await prisma.blogPost.create({ data: body });

    return new Response(JSON.stringify(newPost), { status: 201 });
  } catch (error) {
    console.error("❌ Error creating blog post:", error);
    return new Response("Failed to create blog post", { status: 500 });
  }
}

// import prisma from "@/prisma/prisma"; // Ensure correct path to Prisma client

// export async function GET(req: Request) {
//   try {
//     // Fetch blog posts from the database with correct field names
//     const blogPosts = await prisma.blogPost.findMany({
//       select: {
//         id: true,
//         post_title: true, // ✅ Fixed: Was incorrectly named as `title`
//       },
//     });

//     return new Response(JSON.stringify(blogPosts), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("❌ Error fetching blog posts:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to fetch blog posts" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }
