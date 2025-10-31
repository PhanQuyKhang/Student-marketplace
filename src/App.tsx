import { useState } from "react";
import {
  TokenResponse,
  googleLogout,
  useGoogleLogin,
} from "@react-oauth/google";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { ItemDetail } from "./components/ItemDetail";
import { SellItemForm } from "./components/SellItemForm";
import { UserProfile } from "./components/UserProfile";
import { Item } from "./components/ItemCard";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";
import { ChatDrawer } from "./components/ChatDrawer";

// Mock data for items
const mockItems: Item[] = [
  {
    id: '1',
    title: 'MacBook Pro 13-inch 2020 - Excellent Condition',
    price: 899,
    location: 'North Campus',
    timePosted: '2 hours ago',
    category: 'electronics',
    condition: 'excellent',
    images: ['https://images.unsplash.com/photo-1680370834492-4e683c0d14c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMGxhcHRvcCUyMHBob25lfGVufDF8fHx8MTc1ODI0Njg1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    description: 'Great laptop for programming and design work. Has been my main machine for 2 years. Battery life is still excellent, no major scratches or dents. Comes with original charger and box.',
    seller: {
      name: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=60',
      rating: 4.9,
    },
    isFavorited: false,
  },
  {
    id: '2',
    title: 'Organic Chemistry Textbook - 8th Edition',
    price: 85,
    location: 'Science Library',
    timePosted: '5 hours ago',
    category: 'books',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1608453162650-cba45689c284?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBib29rc3xlbnwxfHx8fDE3NTgyNDY4NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    description: 'Used for CHEM 2410/2420. Some highlighting and notes in margins but all pages intact. Still in good condition. Retail price is $350+.',
    seller: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b8b5?w=150&h=150&fit=crop&crop=face&auto=format&q=60',
      rating: 4.7,
    },
    isFavorited: true,
  },
  {
    id: '3',
    title: 'Vintage Denim Jacket - Size M',
    price: 35,
    location: 'Student Center',
    timePosted: '1 day ago',
    category: 'clothing',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1714583353759-ac534aae73ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWNvbmQlMjBoYW5kJTIwY2xvdGhlcyUyMHZpbnRhZ2V8ZW58MXx8fHwxNzU4MjQ2ODUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    description: 'Classic vintage denim jacket. Perfect for layering. Some fading which adds to the vintage look. No tears or holes.',
    seller: {
      name: 'Mike Torres',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=60',
      rating: 4.8,
    },
    isFavorited: false,
  },
  {
    id: '4',
    title: 'IKEA Desk Lamp - White',
    price: 15,
    location: 'West Campus',
    timePosted: '2 days ago',
    category: 'furniture',
    condition: 'excellent',
    images: ['https://images.unsplash.com/photo-1586023492125-27b9e57b3050?w=400&h=400&fit=crop&auto=format&q=60'],
    description: 'Great condition desk lamp. Works perfectly, no issues. Moving out so need to sell quickly.',
    seller: {
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=60',
      rating: 4.6,
    },
    isFavorited: false,
  },
  {
    id: '5',
    title: 'PlayStation 5 Controller - DualSense',
    price: 45,
    location: 'Gaming Lounge',
    timePosted: '3 days ago',
    category: 'gaming',
    condition: 'excellent',
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop&auto=format&q=60'],
    description: 'Extra PS5 controller in excellent condition. Barely used, no stick drift or button issues.',
    seller: {
      name: 'Jordan Lee',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=60',
      rating: 4.9,
    },
    isFavorited: false,
  },
];

interface StoredUserData {
  favoriteItems: Item[];
  userItems: Item[];
}

const USER_DATA_STORAGE_KEY = 'unimarket_user_data';

const cloneItem = (item: Item): Item => ({
  ...item,
  images: Array.isArray(item.images) ? [...item.images] : [],
  seller: item.seller ? { ...item.seller } : { name: '', avatar: '', rating: 0 },
});

const dedupeItemsById = (items: Item[] | undefined): Item[] => {
  if (!items?.length) {
    return [];
  }

  const map = new Map<string, Item>();
  for (const item of items) {
    if (!item?.id) continue;
    map.set(item.id, cloneItem(item));
  }
  return Array.from(map.values());
};

const normalizeFavorites = (items: Item[]): Item[] =>
  dedupeItemsById(items).map(item => ({ ...item, isFavorited: true }));

const loadAllMarketplaceItems = (): Item[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(USER_DATA_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const allUsers = JSON.parse(raw) as Record<string, StoredUserData>;
    if (!allUsers || typeof allUsers !== 'object') {
      return [];
    }

    const aggregatedItems = Object.values(allUsers).flatMap(user =>
      Array.isArray(user?.userItems) ? user.userItems : []
    );

    return dedupeItemsById(aggregatedItems);
  } catch (error) {
    console.error('Failed to load marketplace data from storage', error);
    return [];
  }
};

const buildItemsForUser = (baseItems: Item[], userItems: Item[], favorites: Item[]): Item[] => {
  const favoriteIds = new Set(favorites.map(item => item.id));
  const normalizedUserItems = dedupeItemsById(userItems).map(item => ({
    ...item,
    isFavorited: favoriteIds.has(item.id),
  }));
  const userItemIds = new Set(normalizedUserItems.map(item => item.id));
  const normalizedBaseItems = dedupeItemsById(baseItems)
    .filter(item => !userItemIds.has(item.id))
    .map(item => ({
      ...item,
      isFavorited: favoriteIds.has(item.id),
    }));

  return [...normalizedUserItems, ...normalizedBaseItems];
};

const getDefaultItems = () => mockItems.map(item => cloneItem(item));
const getDefaultGuestFavorites = () =>
  mockItems.filter(item => item.isFavorited).map(item => cloneItem(item));

const loadUserData = (email: string | undefined | null): StoredUserData => {
  if (!email || typeof window === 'undefined') {
    return { favoriteItems: [], userItems: [] };
  }

  try {
    const raw = window.localStorage.getItem(USER_DATA_STORAGE_KEY);
    if (!raw) {
      return { favoriteItems: [], userItems: [] };
    }

    const allUsers = JSON.parse(raw) as Record<string, StoredUserData>;
    const stored = allUsers?.[email];
    if (!stored) {
      return { favoriteItems: [], userItems: [] };
    }

    return {
      favoriteItems: normalizeFavorites(stored.favoriteItems ?? []),
      userItems: dedupeItemsById(stored.userItems ?? []),
    };
  } catch (error) {
    console.error('Failed to load user data from storage', error);
    return { favoriteItems: [], userItems: [] };
  }
};

const saveUserData = (email: string | undefined | null, data: StoredUserData) => {
  if (!email || typeof window === 'undefined') {
    return;
  }

  try {
    const raw = window.localStorage.getItem(USER_DATA_STORAGE_KEY);
    const allUsers = raw ? JSON.parse(raw) : {};

    allUsers[email] = {
      favoriteItems: normalizeFavorites(data.favoriteItems ?? []),
      userItems: dedupeItemsById(data.userItems ?? []),
    };

    window.localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(allUsers));
  } catch (error) {
    console.error('Failed to persist user data', error);
  }
};

interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceItems, setMarketplaceItems] = useState<Item[]>(() =>
    loadAllMarketplaceItems()
  );
  const [items, setItems] = useState<Item[]>(() =>
    buildItemsForUser(
      [...getDefaultItems(), ...loadAllMarketplaceItems()],
      [],
      getDefaultGuestFavorites()
    )
  );
  const [favoriteItems, setFavoriteItems] = useState<Item[]>(() =>
    getDefaultGuestFavorites()
  );
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [activeChatItem, setActiveChatItem] = useState<Item | null>(null);

  const applyUserDataToState = (
    userListings: Item[],
    favorites: Item[],
    marketplaceListings: Item[] = marketplaceItems
  ) => {
    const normalizedFavorites = normalizeFavorites(favorites);
    const normalizedUserItems = dedupeItemsById(userListings);
    const normalizedMarketplaceItems = dedupeItemsById(marketplaceListings);

    setFavoriteItems(normalizedFavorites);
    setUserItems(normalizedUserItems);
    setMarketplaceItems(normalizedMarketplaceItems);
    setItems(
      buildItemsForUser(
        [...getDefaultItems(), ...normalizedMarketplaceItems],
        normalizedUserItems,
        normalizedFavorites
      )
    );
  };

  const handleGoogleLoginSuccess = async (tokenResponse: TokenResponse) => {
    if (!tokenResponse.access_token) {
      toast.error('Google login did not return an access token.');
      return;
    }

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Google user information');
      }

      const data = await response.json();
      const userProfile: GoogleUser = {
        name: data.name ?? 'Google User',
        email: data.email ?? '',
        picture: data.picture ?? undefined,
      };

      setGoogleUser(userProfile);
      setCurrentPage('profile');

      const storedData = loadUserData(userProfile.email);
      const storedMarketplaceItems = loadAllMarketplaceItems();
      applyUserDataToState(
        storedData.userItems,
        storedData.favoriteItems,
        storedMarketplaceItems
      );

      toast.success(`Logged in as ${userProfile.name}`);
    } catch (error) {
      console.error('Failed to fetch Google user info', error);
      toast.error('Failed to fetch Google user information. Please try again.');
    }
  };

  const handleGoogleLoginError = () => {
    toast.error('Google login failed. Please try again.');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: handleGoogleLoginError,
    scope: 'openid profile email',
  });

  const handleGoogleLogout = () => {
    googleLogout();
    setGoogleUser(null);
    setActiveChatItem(null);
    applyUserDataToState(
      [],
      getDefaultGuestFavorites(),
      loadAllMarketplaceItems()
    );
    toast.info('Logged out of Google');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedItem(null);
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setCurrentPage('item-detail');
  };

  const handleFavoriteToggle = (itemId: string) => {
    const item = items.find(currentItem => currentItem.id === itemId);
    if (!item) {
      return;
    }

    const toggledItem: Item = {
      ...item,
      isFavorited: !item.isFavorited,
    };

    const updatedItems = items.map(currentItem =>
      currentItem.id === itemId ? toggledItem : currentItem
    );

    const updatedFavorites = normalizeFavorites(
      toggledItem.isFavorited
        ? [...favoriteItems.filter(fav => fav.id !== itemId), toggledItem]
        : favoriteItems.filter(fav => fav.id !== itemId)
    );

    setItems(updatedItems);
    setFavoriteItems(updatedFavorites);

    if (googleUser?.email) {
      saveUserData(googleUser.email, {
        favoriteItems: updatedFavorites,
        userItems,
      });
    }

    toast.success(
      toggledItem.isFavorited ? 'Added to favorites' : 'Removed from favorites'
    );
  };

  const handleSellItem = (itemData: any) => {
    const sellerInfo = googleUser
      ? {
          name: googleUser.name,
          avatar:
            googleUser.picture ??
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=60',
          rating: 4.8,
        }
      : itemData.seller;

    const newItem: Item = {
      ...itemData,
      id: Date.now().toString(),
      seller: sellerInfo,
      isFavorited: false,
    };

    const updatedUserItems = dedupeItemsById([newItem, ...userItems]);
    const updatedMarketplaceItems = dedupeItemsById([newItem, ...marketplaceItems]);
    const normalizedFavorites = normalizeFavorites(favoriteItems);

    setMarketplaceItems(updatedMarketplaceItems);
    setUserItems(updatedUserItems);
    setItems(
      buildItemsForUser(
        [...getDefaultItems(), ...updatedMarketplaceItems],
        updatedUserItems,
        normalizedFavorites
      )
    );

    if (googleUser?.email) {
      saveUserData(googleUser.email, {
        favoriteItems: normalizedFavorites,
        userItems: updatedUserItems,
      });
    }

    setCurrentPage('profile');
    toast.success('Item listed successfully!');
  };

  const handleContactSeller = (item: Item) => {
    setActiveChatItem(item);
  };

  const handleEditItem = (item: Item) => {
    toast.info('Edit functionality would open here');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
      case 'categories':
        return (
          <HomePage
            items={items}
            searchQuery={searchQuery}
            onItemClick={handleItemClick}
            onFavoriteToggle={handleFavoriteToggle}
          />
        );
      
      case 'item-detail':
        return selectedItem ? (
          <ItemDetail
            item={selectedItem}
            onBack={() => setCurrentPage('home')}
            onContact={handleContactSeller}
          />
        ) : null;
      
      case 'sell':
        return (
          <SellItemForm
            onSubmit={handleSellItem}
            onCancel={() => setCurrentPage('home')}
          />
        );
      
      case 'profile':
        return (
          <UserProfile
            user={googleUser}
            userItems={userItems}
            favoriteItems={favoriteItems}
            onItemClick={handleItemClick}
            onSellNewItem={() => setCurrentPage('sell')}
            onEditItem={handleEditItem}
          />
        );
      
      default:
        return (
          <HomePage
            items={items}
            searchQuery={searchQuery}
            onItemClick={handleItemClick}
            onFavoriteToggle={handleFavoriteToggle}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={googleUser}
        onLogin={() => googleLogin()}
        onLogout={handleGoogleLogout}
      />
      
      <main className="flex-1 flex flex-col">
        {renderCurrentPage()}
      </main>

      <ChatDrawer
        item={activeChatItem}
        buyer={{
          name: googleUser?.name ?? 'Guest Buyer',
          avatar: googleUser?.picture ?? undefined,
        }}
        onClose={() => setActiveChatItem(null)}
      />

      <Toaster />
    </div>
  );
}