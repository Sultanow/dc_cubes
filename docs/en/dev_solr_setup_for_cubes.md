## Setup and run Solr for local development
Suppose, **C:\development\solr\\** is the installation directory of Solr.

`cd C:\development\solr\bin\`

`.\solr.cmd start`

For restarting Solr use:

`.\solr.cmd restart -p 8983`

The core we use by default is "dc_cubes", create it using the command:

`.\solr.cmd create -c dc_cubes`

Stop Solr:

`.\solr.cmd stop -p 8983`

Enable Cross-origin Resource Sharing (CORS). For this in **C:\development\solr\server\solr-webapp\webapp\WEB-INF\web.xml** include the following filter right after the `<web-app>` line:

```xml
<filter>
  <filter-name>cross-origin</filter-name>
  <filter-class>org.eclipse.jetty.servlets.CrossOriginFilter</filter-class>
  <init-param>
    <param-name>allowedOrigins</param-name>
    <param-value>*</param-value>
  </init-param>
  <init-param>
    <param-name>allowedMethods</param-name>
    <param-value>GET,POST,OPTIONS,DELETE,PUT,HEAD</param-value>
  </init-param>
  <init-param>
    <param-name>allowedHeaders</param-name>
    <param-value>X-Requested-With,Content-Type,Accept,Origin</param-value>
  </init-param>
</filter>

<filter-mapping>
  <filter-name>cross-origin</filter-name>
  <url-pattern>/*</url-pattern>
</filter-mapping>
```

See: https://opensourceconnections.com/blog/2015/03/26/going-cross-origin-with-solr/

Note that the *Access-Control-Allow*-headers need to be set on the response, not the request. Setting it into the request will cause the error:

*Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:3000' is therefore not allowed access.*

See: https://stackoverflow.com/questions/48427027/cors-no-access-control-allow-origin-header-is-present-even-though-response-is
