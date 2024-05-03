import { Router } from '@ptsq/server';
import { expect, test } from 'vitest';
import { baseRouter } from './server';

const testCaller = Router.serverSideCaller(baseRouter).create({});

test('Should query the greeting with only firstName', async () => {
  const firstName = 'John';

  const response = await testCaller.greetings.query({
    firstName,
  });

  expect(response).toBe(`Hello, ${firstName}`);
});

test('Should query the greeting with firstName and lastName', async () => {
  const firstName = 'John';
  const lastName = 'Doe';

  const response = await testCaller.greetings.query({
    firstName,
    lastName,
  });

  expect(response).toBe(`Hello, ${firstName} ${lastName}`);
});
