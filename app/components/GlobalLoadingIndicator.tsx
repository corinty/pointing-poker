import {useEffect} from 'react';
import {useNavigation} from '@remix-run/react';
import {
  NavigationProgress,
  resetNavigationProgress,
  startNavigationProgress,
} from '@mantine/nprogress';

export const GlobalLoadingIndicator = () => {
  const {state} = useNavigation();
  useEffect(() => {
    if (state === 'idle') {
      // we are idle so hide the progress bar
      resetNavigationProgress();
    } else {
      // we are doing something so show the progress bar
      // and allow it to increment
      startNavigationProgress();
    }
  }, [state]);

  // I set the stepInterval to 100 so it increases every 100 milliseconds
  // but you can set it to something that feels nice for your app
  return <NavigationProgress stepInterval={100} />;
};
