import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

export class CustomWorld extends World {
  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
