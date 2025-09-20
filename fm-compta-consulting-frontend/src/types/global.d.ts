import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: typeof mongoose | undefined;
}