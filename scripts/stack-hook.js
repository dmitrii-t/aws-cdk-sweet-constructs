/**
 * Hook for Babel to process *.ts sources
 */
require('@babel/register')({
  extensions: ['.ts', '.tsx', '.js', '.jsx']
});

require('./stack.ts').stack()
  .then(() => {
  })
  .catch(err => {
    console.error(err);
  });

