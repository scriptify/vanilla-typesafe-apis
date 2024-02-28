// Those types don't neccessarily make sense, but they combine most of the complex
// type requirements that we have

type FakeComplexDTO = {
  message: string;
  price?: {
    amount: number;
    currency: 'EUR' | 'USD';
  } | null;
  comments: {
    message: string;
    user: {
      name: string;
      email: string;
      avatar: {
        url: string;
        formats: {
          thumbnail: string;
          small: string;
          medium: string;
          large: string;
        };
      };
    };
  }[];
  id: string;
  createdAt: string;
  owner: {
    name: string;
    organization: {
      name: string;
      address: string;
      logo: string;
    };
  };
};

type FakeBody = Omit<Pick<FakeComplexDTO, 'comments' | 'message' | 'price'>, 'id'>;

class FakeController {}
