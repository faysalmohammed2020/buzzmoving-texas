<<<<<<< HEAD
import { NextResponse } from "next/server";
=======
>>>>>>> 0fed351b59033d66660dc26f8e3a3ca11cbc8ba8
import prisma from "@/prisma/prisma";

// ✅ Create New Blog Post
export async function POST(req: Request) {
  try {
    const { post_title, post_content, category, tags } = await req.json();

    if (!post_title || !post_content || !category || !tags) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const newBlogPost = await prisma.blogPost.create({
      data: { post_name: post_title, post_title, post_content, category, tags },
    });

    return NextResponse.json(newBlogPost, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating blog post:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}

// ✅ Update Blog Post
export async function PUT(req: Request) {
  try {
    const { id, post_title, post_content, category, tags } = await req.json();

    if (!id || !post_title || !post_content || !category || !tags) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const updatedBlogPost = await prisma.blogPost.update({
      where: { id },
      data: { post_title, post_content, category, tags },
    });

    return NextResponse.json(updatedBlogPost, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating blog post:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

// ✅ Delete Blog Post
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Blog post ID is required" }, { status: 400 });
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Blog post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting blog post:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}

// ✅ Fetch All Blog Posts
export async function GET() {
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

    console.log("🔍 Fetched Blog Posts:", blogPosts); // Debug API response

    return NextResponse.json(blogPosts, { status: 200 });
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error fetching blog posts:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
=======
    console.error("❌ Error fetching blogs:", error);
    return new Response("Failed to fetch blog posts", { status: 500 });
>>>>>>> 0fed351b59033d66660dc26f8e3a3ca11cbc8ba8
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
