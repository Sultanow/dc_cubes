FROM alpine:latest
WORKDIR /
# Install curl and bash
RUN apk --no-cache add curl
RUN apk add --no-cache bash
# Copy importer scripts
COPY docker/solr_importer/init_scheme.sh init_scheme.sh
COPY docker/solr_importer/import_sample_data.sh import_sample_data.sh
COPY docker/solr_importer/init_scheme_with_sample_data.sh init_scheme_with_sample_data.sh
# Copy sample data
COPY docker/solr_importer/sample-data/df_all_pseudo-01_small.csv /sample-data/df_all_pseudo-01_small.csv
COPY docker/solr_importer/sample-data/df_all_pseudo-01.csv /sample-data/df_all_pseudo-01.csv

RUN chmod +x /init_scheme.sh
RUN chmod +x /import_sample_data.sh
RUN chmod +x /init_scheme_with_sample_data.sh
ENTRYPOINT ["./init_scheme_with_sample_data.sh"]