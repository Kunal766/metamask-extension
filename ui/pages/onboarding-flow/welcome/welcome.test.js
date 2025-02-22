import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import initializedMockState from '../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import { setFirstTimeFlowType } from '../../../store/actions';
import {
  ONBOARDING_METAMETRICS,
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_COMPLETION_ROUTE,
} from '../../../helpers/constants/routes';
import OnboardingWelcome from './welcome';

const mockHistoryReplace = jest.fn();
const mockHistoryPush = jest.fn();

jest.mock('../../../store/actions.ts', () => ({
  setFirstTimeFlowType: jest.fn().mockReturnValue(
    jest.fn((type) => {
      return type;
    }),
  ),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
    replace: mockHistoryReplace,
  }),
}));

describe('Onboarding Welcome Component', () => {
  const mockState = {
    metamask: {
      identities: {},
      selectedAddress: '',
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialized State Conditionals with keyrings and firstTimeFlowType', () => {
    it('should route to secure your wallet when keyring is present but not imported first time flow type', () => {
      const mockStore = configureMockStore([thunk])(initializedMockState);

      renderWithProvider(<OnboardingWelcome />, mockStore);
      expect(mockHistoryReplace).toHaveBeenCalledWith(
        ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
      );
    });

    it('should route to completion when keyring is present and imported first time flow type', () => {
      const importFirstTimeFlowState = {
        ...initializedMockState,
        metamask: {
          ...initializedMockState.metamask,
          firstTimeFlowType: 'import',
        },
      };
      const mockStore = configureMockStore([thunk])(importFirstTimeFlowState);

      renderWithProvider(<OnboardingWelcome />, mockStore);
      expect(mockHistoryReplace).toHaveBeenCalledWith(
        ONBOARDING_COMPLETION_ROUTE,
      );
    });
  });

  describe('Welcome Component', () => {
    const mockStore = configureMockStore([thunk])(mockState);

    it('should render', () => {
      renderWithProvider(<OnboardingWelcome />, mockStore);
      const onboardingWelcome = screen.queryByTestId('onboarding-welcome');
      expect(onboardingWelcome).toBeInTheDocument();
    });

    it('should set first time flow to create and route to metametrics', () => {
      renderWithProvider(<OnboardingWelcome />, mockStore);

      const createWallet = screen.getByTestId('onboarding-create-wallet');
      fireEvent.click(createWallet);

      expect(setFirstTimeFlowType).toHaveBeenCalledWith('create');
    });

    it('should set first time flow to import and route to metametrics', () => {
      renderWithProvider(<OnboardingWelcome />, mockStore);

      const createWallet = screen.getByTestId('onboarding-import-wallet');
      fireEvent.click(createWallet);

      expect(setFirstTimeFlowType).toHaveBeenCalledWith('import');
      expect(mockHistoryPush).toHaveBeenCalledWith(ONBOARDING_METAMETRICS);
    });
  });
});
