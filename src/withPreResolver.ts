import {
  DefaultBodyType,
  HttpResponseResolver,
  PathParams,
} from "msw";

type PreResolverFunction<
  Params extends PathParams<keyof Params>,
  RequestBodyType extends DefaultBodyType,
  ResponseBodyType extends DefaultBodyType,
> = (
  props: Parameters<
    HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>
  >[0],
) => Promise<
  | ReturnType<HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>>
  | undefined
>;

/** Higher-order response resolver doing body validation in msw handlers. */
export const withPreResolver =
  <
    Params extends PathParams<keyof Params> = PathParams,
    RequestBodyType extends DefaultBodyType = DefaultBodyType,
    ResponseBodyType extends DefaultBodyType = DefaultBodyType,
  >(
    preResolver: PreResolverFunction<Params, RequestBodyType, ResponseBodyType>,
    /** The response resolver to be wrapped. */
    resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>,
  ) =>
  async (
    props: Parameters<
      HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>
    >[0],
  ) => {
    const preReturn = await preResolver(props);
    if (preReturn) return preReturn;
    return resolver(props);
  };

