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

/** Wraps an `msw` response resolve with more behavior. */
export const withPreResolver =
  <
    Params extends PathParams<keyof Params> = PathParams,
    RequestBodyType extends DefaultBodyType = DefaultBodyType,
    ResponseBodyType extends DefaultBodyType = DefaultBodyType,
  >(
    /** 
     * The logic to execute before calling the main response resolver. Must return either
     * - `undefined` to continue with the main resolver, or
     * - a response object to short-circuit the main resolver.
     */
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

