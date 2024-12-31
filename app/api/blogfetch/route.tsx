import prisma from '@/prisma/prisma'; // Make sure to import your Prisma client

export async function GET(req: Request) {
  try {
    // Fetch blog posts from the database
    const blogPosts = await prisma.blogPost.findMany({
      // You can adjust the query to your needs, like adding pagination or filtering
      select: {
        id: true,
        title: true,
        content: true,
        category: true, // Assuming this exists in your model
        tags: true,     // Assuming this exists in your model
        createdAt: true,     // Assuming your model has this field
      },
    });

    return new Response(JSON.stringify(blogPosts), { status: 200 });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return new Response("Failed to fetch blog posts", { status: 500 });
  }
}
