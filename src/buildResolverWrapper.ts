import {
  PathParams,
  DefaultBodyType,
  HttpResponseResolver,
} from "msw";

type BuildResolverWrapper = <
  Params extends PathParams = PathParams,
  RequestBodyType extends DefaultBodyType = DefaultBodyType,
  WrapperResponse extends DefaultBodyType = DefaultBodyType
>(
  wrapperFn: HttpResponseResolver<Params, RequestBodyType, WrapperResponse>
) => <ResponseBodyType extends DefaultBodyType = DefaultBodyType>(
  resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>
) => HttpResponseResolver<
  Params,
  RequestBodyType,
  ResponseBodyType | WrapperResponse
>;

export const buildResolverWrapper: BuildResolverWrapper = 
  <
    Params extends PathParams,
    RequestBodyType extends DefaultBodyType,
    WrapperResponse extends DefaultBodyType
  >(
    wrapperFn: HttpResponseResolver<Params, RequestBodyType, WrapperResponse>
  ) =>
  <ResponseBodyType extends DefaultBodyType>(
    resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>
  ): HttpResponseResolver<Params, RequestBodyType, ResponseBodyType | WrapperResponse> =>
  async (...resolverArgs) => {
    const earlyResponse = await wrapperFn(...resolverArgs);
    if (earlyResponse) return earlyResponse;
    return resolver(...resolverArgs);
  };