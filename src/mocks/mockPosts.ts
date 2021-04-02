import populate from "../../libs/populate-lib";
import { Post } from "src/interfaces/Post";

// Date in DynamoDB
// https://stackoverflow.com/questions/40561484/what-data-type-should-be-use-for-timestamp-in-dynamodb
const posts: Post[] = [
  {
    postId: "postId-01",
    userId: "cef1d1f9-df99-436d-9b1e-fae27e6322ea",
    title: "What is SSB?",
    text:
      "SSB is an experimental feature that allows any website to run in desktop mode, with its own window. The Site Specific Browser feature, which was available in Firefox 73 and above, allowed you to launch any website in a window with a minimal UI.",
    createdAt: "2021-03-30T08:27:03.141Z",
    author: "John Snow",
  },
  {
    postId: "postId-02",
    userId: "93bfe65d-64d7-4ee7-94fc-312e0249f667",
    title: "What Was Dropped?",
    text:
      "Firefox is dropping an experimental feature that supports installing Progressive Web Apps to the desktop. This feature is known as Site Specific Browser — SSB.",
    createdAt: "2021-03-30T08:28:14.764Z",
    author: "Tyrion Lannister",
  },
  {
    postId: "postId-03",
    userId: "93bfe65d-64d7-4ee7-94fc-312e0249f667",
    title: "What Was Observed?",
    text:
      "For those who were observing the situation, Mozilla had already indicated that they might drop support for SSB in future releases. The reason for this removal can be found in the bug tracker comment.",
    createdAt: "2021-03-25T10:44:29.610Z",
    author: "Ben Stark",
  },
  {
    postId: "postId-04",
    userId: "cef1d1f9-df99-436d-9b1e-fae27e6322ea",
    title: "Twitter discovering",
    text: "Discover Medium writers you already follow on Twitter.",
    createdAt: "2021-03-31T09:26:38.475Z",
    author: "Daenerys Targaryen",
  },
];

populate("posts", posts);

export default posts;
