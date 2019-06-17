import { unsafeRunTE } from 'kleisli-ts/lib/unsafe';

import { main } from './main';

unsafeRunTE(main.run());
