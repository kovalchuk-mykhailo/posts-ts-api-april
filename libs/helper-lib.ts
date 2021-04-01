import { Post } from "src/interfaces/Post";

export const sortPostsByDate = (arr: Post[], isDescending: boolean) => {
  return arr.sort((a, b) => {
    if (isDescending) {
      return a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0;
    }

    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
  });
};
