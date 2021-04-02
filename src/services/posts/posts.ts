import { Context, APIGatewayEvent } from "aws-lambda";
import * as uuid from "uuid";

import handler, {
  isArrayEmpty,
  isObjectEmpty,
  ResponseError,
  throwNotFoundError,
} from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import {
  getBooleanFromString,
  getDataFromEvent,
  paginateItems,
  sortPostsByDate,
} from "../../../libs/helper-lib";
import { PaginatedPosts, Post } from "src/interfaces/Post";
import { ResponseStatus } from "src/interfaces/ResponseStatus";
import { ERROR_TEXTS, SORTING, STATUS } from "src/constants/posts";

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

export const createPost = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<Post> {
  const data = getDataFromEvent(event);

  const { text = "", title = "", author = "Incognito", userId } = data;

  if (!userId) {
    throw new ResponseError(ERROR_TEXTS.POST.unknownUser, STATUS.unknownUser);
  }

  const newPost: Post = {
    createdAt: new Date().toISOString(),
    postId: uuid.v1(),
    text,
    title,
    userId,
    author,
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

export const getAllPosts = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<PaginatedPosts> {
  const {
    sort = SORTING.DEFAULT.sort,
    descending = SORTING.DEFAULT.descending,
    limit,
    page,
    title = "",
  } = event.queryStringParameters || {};

  const params = {
    TableName: process.env.POSTS_TABLENAME,
    FilterExpression: "contains (#title, :title)",
    ExpressionAttributeNames: {
      "#title": "title",
    },
    ExpressionAttributeValues: {
      ":title": title,
    },
  };

  let posts;

  try {
    posts = (await dynamoDb.scanAll(params)) || [];
  } catch (error) {
    throw new ResponseError(error.message, 400);
  }

  let sortedPosts = [...posts];

  if (sort === "date") {
    sortedPosts = sortPostsByDate(posts, getBooleanFromString(descending));
  }

  const paginatedPosts = paginateItems(sortedPosts, +limit, +page);

  const response: PaginatedPosts = {
    posts: paginatedPosts,
    postsNum: posts.length,
  };

  return response;
});
