import { Context, APIGatewayEvent } from "aws-lambda";
import * as uuid from "uuid";

import handler, {
  isArrayEmpty,
  isObjectEmpty,
  ResponseError,
  throwNotFoundError,
} from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { getDataFromEvent, sortPostsByDate } from "../../../libs/helper-lib";
import { Post } from "src/interfaces/Post";
import { ResponseStatus } from "src/interfaces/ResponseStatus";

const ERROR_TEXTS = {
  POSTS: {
    notFound: "Posts are not found.",
  },
  POST: {
    notFound: "Post is not found.",
    unknownUser: "Unknown user",
  },
};

export const getPostsByUser = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<Post[]> {
  const userId = event.pathParameters.userId;

  const postParams = {
    TableName: process.env.POSTS_TABLENAME,
    IndexName: "userId-index",
    KeyConditionExpression: "#userId = :id",
    ExpressionAttributeNames: {
      "#userId": "userId",
    },
    ExpressionAttributeValues: {
      ":id": userId,
    },
  };

  const result = (await dynamoDb.query(postParams))?.Items;

  if (isArrayEmpty(result)) {
    throwNotFoundError(ERROR_TEXTS.POSTS.notFound);
  }

  return result as Post[];
});

//Should work well!
export const getOnePost = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<Post> {
  const postId = event.pathParameters.postId;

  const params = {
    TableName: process.env.POSTS_TABLENAME,
    Key: {
      postId,
    },
  };

  const result = (await dynamoDb.get(params))?.Item || {};

  if (isObjectEmpty(result)) {
    throwNotFoundError(ERROR_TEXTS.POST.notFound);
  }

  return result as Post;
});

const STATUS = {
  unknownUser: 400, // ???
  problemsPutItem: 400, // ???
};

const DEFAULT_USER_ID = "userId-03";

export const createPost = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<Post> {
  // to do: to get rid of defaultId
  // to demonstrate a work flow without UserId ( we set the default Id)
  // const userId =
  //   event.requestContext.identity.cognitoIdentityId || DEFAULT_USER_ID;

  const data = getDataFromEvent(event);

  const { text = "", title = "", userId } = data;

  if (!userId) {
    throw new ResponseError(ERROR_TEXTS.POST.unknownUser, STATUS.unknownUser);
  }

  const newPost: Post = {
    createdAt: new Date().toISOString(),
    postId: uuid.v1(),
    text,
    title,
    userId,
  };
  const params = {
    TableName: process.env.POSTS_TABLENAME,
    Item: newPost,
  };

  try {
    await dynamoDb.put(params);
  } catch (error) {
    throw new ResponseError(
      `Put Item to db issue: ${error.message}`,
      STATUS.problemsPutItem
    );
  }

  return params.Item;
});

export const deletePost = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<ResponseStatus> {
  const postId = event.pathParameters.postId;

  const data = getDataFromEvent(event);
  const { userId } = data;

  if (!userId) {
    throw new ResponseError(ERROR_TEXTS.POST.unknownUser, STATUS.unknownUser);
  }

  const params = {
    TableName: process.env.POSTS_TABLENAME,
    Key: {
      postId,
    },
    ReturnValues: "ALL_OLD",
    ConditionExpression: "userId = :id",
    ExpressionAttributeValues: {
      ":id": userId,
    },
  };

  const handleDeleteItemError = (err, data) => {
    if (err) {
      throw new ResponseError(
        `Unable to delete item. Error JSON: ${JSON.stringify(err, null, 2)}`,
        405
      );
    }
  };

  const result = await dynamoDb.delete(params, handleDeleteItemError);

  const deletedPost: Post = result.Attributes as Post;

  if (!deletedPost) {
    throw new ResponseError(ERROR_TEXTS.POST.notFound, 404);
  }

  return { status: true };
});

//Should work well!
export const getAllPosts = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<Post[]> {
  const { descending = false, sort } = event.queryStringParameters || {};

  const params = {
    TableName: process.env.POSTS_TABLENAME,
  };

  const posts = (await dynamoDb.scanAll(params)) || [];

  if (isArrayEmpty(posts)) {
    throwNotFoundError(ERROR_TEXTS.POSTS.notFound);
  }

  let sortedPosts = [...posts];

  if (sort === "date") {
    sortedPosts = sortPostsByDate(posts, !!descending);
  }

  return sortedPosts as Post[];
});
