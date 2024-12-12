import {
  PathParams,
  DefaultBodyType,
  HttpResponseResolver,
  HttpResponse,
} from "msw";

export const buildResolverWrapper = <
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
): HttpResponseResolver<
    Params,
    RequestBodyType,
    ResponseBodyType | WrapperResponse
> => 
    async (...resolverArgs) => {
        const earlyResponse = await wrapperFn(...wrapperArgs);
        if (earlyResponse) return earlyResponse;
        return resolver(...resolverArgs);
    };
