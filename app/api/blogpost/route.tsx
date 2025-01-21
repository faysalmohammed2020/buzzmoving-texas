// import { NextResponse } from "next/server";
// import prisma from "@/prisma/prisma";  // Ensure the correct import path

// export async function POST(req: Request) {
//   try {
//     // Ensure you're parsing the JSON body
//     const { title, content, category, tags } = await req.json();

//     console.log("Received data:", { title, content });

//     // Basic validation
//     if (!title || !content || !category || !tags) {
//       return new NextResponse("Title and content are required", { status: 400 });
//     }

//     // Save to database using Prisma
//     const newBlogPost = await prisma.blogPost.create({
//       data: {
//         title,
//         content,
//         category,
//         tags
//       },
//     });

//     console.log("New blog post created:", newBlogPost);

//     // Return the newly created blog post
//     return new NextResponse(JSON.stringify(newBlogPost), { status: 201 });
//   } catch (error) {
//     console.error('Error creating blog post:', error);
//     return new NextResponse("Failed to create blog post", { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma"; // Ensure correct import path

export async function POST(req: Request) {
  try {
    const { title, content, category, tags } = await req.json();

    if (!title || !content || !category || !tags) {
      return new NextResponse("All fields are required", { status: 400 });
    }

    const newBlogPost = await prisma.blogPost.create({
      data: { title, content, category, tags },
    });

    return NextResponse.json(newBlogPost, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return new NextResponse("Failed to create blog post", { status: 500 });
  }
}

// DELETE a blog post
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json(); // Extract blog post ID from request

    if (!id) {
      return new NextResponse("Blog post ID is required", { status: 400 });
    }

    // Delete from database
    await prisma.blogPost.delete({
      where: { id },
    });

    return new NextResponse("Blog post deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return new NextResponse("Failed to delete blog post", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, title, content, category, tags } = await req.json();

    if (!id || !title || !content || !category || !tags) {
      return new NextResponse("All fields are required", { status: 400 });
    }

    const updatedBlogPost = await prisma.blogPost.update({
      where: { id },
      data: { title, content, category, tags },
    });

    return NextResponse.json(updatedBlogPost, { status: 200 });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return new NextResponse("Failed to update blog post", { status: 500 });
  }
}
