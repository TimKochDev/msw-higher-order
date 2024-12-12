import {
  PathParams,
  DefaultBodyType,
  HttpResponseResolver,
} from "msw";

type BuildResolverWrapper = <
  WrapperArgs extends any[],
  Params extends PathParams = PathParams,
  RequestBodyType extends DefaultBodyType = DefaultBodyType,
  WrapperResponse extends DefaultBodyType = DefaultBodyType
>(
  wrapperFn: () => Promise<void> | void | ReturnType<HttpResponseResolver<Params, RequestBodyType, WrapperResponse>>,
) => <
  Params extends PathParams = PathParams,
  RequestBodyType extends DefaultBodyType = DefaultBodyType,
  ResponseBodyType extends DefaultBodyType = DefaultBodyType
>(
    // TODO: here resolver args
) => (
  resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>
) => HttpResponseResolver<
  Params,
  RequestBodyType,
  ResponseBodyType | WrapperResponse
>;

export const buildResolverWrapper: BuildResolverWrapper =
  (wrapperFn) =>
  () =>
  (resolver) =>
  async (...resolverArgs) => {
    const earlyResponse = await wrapperFn();
    if (earlyResponse) return earlyResponse;
    return resolver(...resolverArgs);
  };
