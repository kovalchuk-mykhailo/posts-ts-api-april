import { APIGatewayEvent } from "aws-lambda";

import { Post } from "src/interfaces/Post";

/**
 * Sort array of Posts by Date in the descending and ascending ways.
 * @param arr - array of Posts.
 * @param isDescending - boolean value for specify sorting way. Default way = ascending
 */
export const sortPostsByDate = (arr: Post[], isDescending: boolean) => {
  return arr.sort((a, b) => {
    if (isDescending) {
      return a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0;
    }

    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
  });
};

export const getDataFromEvent = (event: APIGatewayEvent) => {
  return JSON.parse(event.body) || {};
};
