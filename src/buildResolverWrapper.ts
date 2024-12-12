import {
  PathParams,
  DefaultBodyType,
  HttpResponseResolver,
  HttpResponse,
} from "msw";

type BuildResolverWrapper = <
  WrapperArgs extends any[],
  Params extends PathParams = PathParams,
  RequestBodyType extends DefaultBodyType = DefaultBodyType,
  WrapperResponse extends DefaultBodyType = DefaultBodyType
>(
  wrapperFn: (...args: WrapperArgs) => Promise<void> | void | ReturnType<HttpResponseResolver<Params, RequestBodyType, WrapperResponse>>,
) => <
  Params extends PathParams = PathParams,
  RequestBodyType extends DefaultBodyType = DefaultBodyType,
  ResponseBodyType extends DefaultBodyType = DefaultBodyType
>(
  ...wrapperArgs: WrapperArgs
) => (
  resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>
) => HttpResponseResolver<
  Params,
  RequestBodyType,
  ResponseBodyType | WrapperResponse
>;

export const buildResolverWrapper: BuildResolverWrapper =
  (wrapperFn) =>
  (...wrapperArgs) =>
  (resolver) =>
  async (...resolverArgs) => {
    const earlyResponse = await wrapperFn(...wrapperArgs);
    if (earlyResponse) return earlyResponse;
    return resolver(...resolverArgs);
  };
