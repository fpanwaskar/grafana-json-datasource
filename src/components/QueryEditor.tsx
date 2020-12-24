import defaults from 'lodash/defaults';
import React from 'react';
import { Icon, InlineFieldRow, InlineField, Segment, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { JsonApiDataSourceOptions, JsonApiQuery, defaultQuery } from '../types';
import { JsonPathQueryField } from './JsonPathQueryField';

type Props = QueryEditorProps<DataSource, JsonApiQuery, JsonApiDataSourceOptions>;

export const QueryEditor: React.FC<Props> = ({ onRunQuery, onChange, query }) => {
  const { fields } = defaults(query, defaultQuery);

  const onChangePath = (i: number) => (e: string) => {
    fields[i] = { ...fields[i], jsonPath: e };
    onChange({ ...query, fields });
  };

  const addField = (i: number) => () => {
    if (fields) {
      fields.splice(i + 1, 0, { name: '', jsonPath: '' });
    }
    onChange({ ...query, fields });
  };

  const removeField = (i: number) => () => {
    if (fields) {
      fields.splice(i, 1);
    }
    onChange({ ...query, fields });
    onRunQuery();
  };

  const mapQueryFields = (field: any, index: number) => (
    <InlineFieldRow key={index}>
      {/* prettier-ignore */}
      <InlineField
        label="Query"
        tooltip={
          <div>A <a href="https://goessner.net/articles/JsonPath/">JSON Path</a> query that selects one or more values from a JSON object.</div>
        }
        grow
      >
        <JsonPathQueryField onBlur={onRunQuery} onChange={onChangePath(index)} query={field.jsonPath} />
      </InlineField>
      <a className="gf-form-label" onClick={addField(index)}>
        <Icon name="plus" />
      </a>
      {fields.length > 1 ? (
        <a className="gf-form-label" onClick={removeField(index)}>
          <Icon name="minus" />
        </a>
      ) : null}
    </InlineFieldRow>
  );

  return (
    <>
      {/* prettier-ignore */}
      <InlineFieldRow>
        <InlineField
          label="Path"
          tooltip="Append a custom path to the data source URL. Should start with a forward slash (/)."
          grow
        >
          <Input
            placeholder="/orders/${orderId}"
            value={query.urlPath}
            onChange={e => onChange({ ...query, urlPath: e.currentTarget.value })}
          />
        </InlineField>
        <InlineField
          label="Query string"
          tooltip="Add custom query parameters to your URL. Any parameters you add here overrides the custom parameters that have been configured by the data source."
          grow
        >
          <Input
            placeholder="page=1&limit=100"
            value={query.queryParams}
            onChange={e => onChange({ ...query, queryParams: e.currentTarget.value })}
          />
        </InlineField>
        <InlineField label="Alias" tooltip="Add an alias to your series which you can use to target overrides" grow>
          <Input
            placeholder="Alias"
            value={query.alias}
            onChange={e => onChange({ ...query, alias: e.currentTarget.value })}
          />
        </InlineField>
        <InlineField
          label="Cache Time"
          tooltip="Time in seconds that the response will be cached in Grafana after receiving it."
        >
          <Segment
            value={{ label: formatCacheTimeLabel(query.cacheDurationSeconds), value: query.cacheDurationSeconds }}
            options={[0, 5, 10, 30, 60, 60 * 2, 60 * 5, 60 * 10, 60 * 30, 3600, 3600 * 2, 3600 * 5].map(value => ({
              label: formatCacheTimeLabel(value),
              value,
              description: value ? '' : 'Response is not cached at all',
            }))}
            onChange={({ value }) => onChange({ ...query, cacheDurationSeconds: value! })}
          />
        </InlineField>
      </InlineFieldRow>
      {fields ? fields.map(mapQueryFields) : null}
    </>
  );
};

const defaultCacheDuration = 300;

export const formatCacheTimeLabel = (s: number = defaultCacheDuration) => {
  if (s < 60) {
    return s + 's';
  } else if (s < 3600) {
    return s / 60 + 'm';
  }

  return s / 3600 + 'h';
};
