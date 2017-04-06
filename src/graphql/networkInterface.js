import { graphql, print } from 'graphql';
import schema from './schema';


class DummyNetworkInterface {
  constructor() {
    this.nextId = 0;
    this.subscriptions = {};
    window.ni = this;
    addEventListener('SUBSCRIPTION_DATA', (e) => {this.onSubscriptionData(e)});
  }

  delay = (ms) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  formatErrors = (errors) => {
    if (Array.isArray(errors)) return errors;
    if (errors && errors.message) return [errors];
    return [{ message: 'Unknown error' }];
  }

  getId = () => {
    const id = this.nextId.toString();
    this.nextId++;
    return id;
  }

  query = ({ query, variables, operationName }) => {
    return this.delay(100).then(() => {
      return graphql(
        schema,
        print(query),
        null,
        null,
        variables,
        operationName,
      );
    });
  }

  subscribe = (options, handler) => {
    if (!options.query) {
      throw new Error('Must provide `query` to subscribe.');
    }

    if (!handler) {
      throw new Error('Must provide `handler` to subscribe.');
    }

    const query = print(options.query);
    const { variables, operationName } = options;
    const _options = { query, variables, operationName }

    if (
      !(typeof query === 'string') ||
      ( operationName && !(typeof operationName === 'string')) ||
      ( variables && !(typeof variables === 'object'))
    ) {
      throw new Error('Incorrect option types to subscribe. ' +
      '`subscription` must be a string, `operationName` must be a ' +
      'string, and `variables` must be an object.');
    }

    const subId = this.getId();
    this.subscriptions[subId] = { handler, options };
    return subId;
  }

  onSubscriptionData = (e) => {
    const { id: subId } = e.detail;
    const { handler, options } = this.subscriptions[subId];
    const queryPromise = this.query(options)
    queryPromise.then(result => {
      const payloadData = result.data || null;
      const payloadErrors = result.errors
        ? this.formatErrors(result.errors)
        : null;
      handler(payloadErrors, payloadData);
    })
  }
}

const networkInterface = new DummyNetworkInterface();
export default networkInterface;
