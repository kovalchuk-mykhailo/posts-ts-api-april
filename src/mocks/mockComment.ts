import populate from "../../libs/populate-lib";
import { Comment } from "src/interfaces/Comment";

// Date in DynamoDB
// https://stackoverflow.com/questions/40561484/what-data-type-should-be-use-for-timestamp-in-dynamodb
const comments: Comment[] = [
  {
    postId: "postId-01",
    userId: "userId-01",
    commentId: 'comment-01',
    text: "It's really incredible!!!",
    createdAt: "2021-03-30T08:27:03.141Z",
  },
  {
    postId: "postId-02",
    userId: "userId-01",
    commentId: 'comment-02',
    text: "It's amazing! Top for its money!",
    createdAt: "2021-03-30T08:28:14.764Z",
  },
  {
    postId: "postId-03",
    userId: "userId-02",
    commentId: 'comment-03',
    text: "Good, but I thought it would be better.",
    createdAt: "2021-03-25T10:44:29.610Z",
  },
  {
    postId: "postId-04",
    userId: "userId-01",
    commentId: 'comment-04',
    text: "Enough good.",
    createdAt: "2021-03-31T09:26:38.475Z",
  },
];

populate("comments", comments);

export default comments;
