import { failure, initial, pending, RemoteData, success } from '@devexperts/remote-data-ts';
import Promise from 'bluebird';

async function* getData(): AsyncIterableIterator<RemoteData<string, number>> {
  yield pending;

  await Promise.delay(500);

  yield (Math.random() > 0.5) ? failure('Out of luck') : success(42);
}

const generator = getData();

(async () => {
  let rd: RemoteData<string, number> = initial;
  let done = false;
  do {
    rd.foldL(
      () => console.log('initial'),
      () => console.log('pending'),
      (err) => console.error('failure: ', err),
      (num) => console.log('success: ', num),
    );
    const res = (await generator.next());
    rd = res.value;
    done = res.done;
  } while (!done);
})();
