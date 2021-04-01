import populate from "../../libs/populate-lib";
import { Post } from "src/interfaces/Post";

// Date in DynamoDB
// https://stackoverflow.com/questions/40561484/what-data-type-should-be-use-for-timestamp-in-dynamodb
const posts: Post[] = [
  {
    postId: "postId-01",
    userId: "userId-01",
    title: "My new Review",
    text: "It's really incrediable!!!",
    createdAt: "2021-03-30T08:27:03.141Z",
  },
  {
    postId: "postId-02",
    userId: "userId-01",
    title: "My new Review-02",
    text: "It's amazing! Top for its money!",
    createdAt: "2021-03-30T08:28:14.764Z",
  },
  {
    postId: "postId-03",
    userId: "userId-02",
    title: "My new Review-02",
    text: "Good, but I thought it would be better.",
    createdAt: "2021-03-25T10:44:29.610Z",
  },
  {
    postId: "postId-04",
    userId: "userId-01",
    title: "My new Review-04",
    text: "Enough good.",
    createdAt: "2021-03-31T09:26:38.475Z",
  },
];

populate("posts", posts);

export default posts;
