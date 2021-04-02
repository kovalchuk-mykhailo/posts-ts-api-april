export interface Post {
  createdAt: string;
  postId: string;
  text: string;
  title: string;
  userId: string;
  author: string;
}

export interface PaginatedPosts {
  posts: Post[];
  postsNum: number;
}
