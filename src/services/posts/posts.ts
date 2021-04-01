import { Context, APIGatewayEvent } from "aws-lambda";
import * as uuid from "uuid";

import handler, {
  isArrayEmpty,
  isObjectEmpty,
  ResponseError,
  throwNotFoundError,
} from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
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
  // to demonstrate a work flow without UserId ( we set the default Id)
  const userId =
    event.requestContext.identity.cognitoIdentityId || DEFAULT_USER_ID;

  if (!userId) {
    throw new ResponseError(
      ERROR_TEXTS.POST.unknownUser.concat(JSON.stringify(event.requestContext)),
      STATUS.unknownUser
    );
  }

  const data = JSON.parse(event.body);

  const { text, title } = data;

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
): Promise<ResponseStatus<Post>> {
  const postId = event.pathParameters.postId;

  const params = {
    TableName: process.env.POSTS_TABLENAME,
    Key: {
      postId,
    },
    ReturnValues: "ALL_OLD",
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

  return { status: true, item: deletedPost };
});

//Should work well!
export const getAllPosts = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<Post[]> {
  const params = {
    TableName: process.env.POSTS_TABLENAME,
  };

  const result = (await dynamoDb.scanAll(params)) || [];

  if (isArrayEmpty(result)) {
    throwNotFoundError(ERROR_TEXTS.POSTS.notFound);
  }

  return result as Post[];
});
