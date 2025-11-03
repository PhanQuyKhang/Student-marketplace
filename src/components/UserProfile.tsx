import { useState } from "react";
import { Edit3, Plus, Eye, Heart, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ItemCard, Item } from "./ItemCard";

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    picture?: string;
  } | null;
  userItems: Item[];
  favoriteItems: Item[];
  onItemClick: (item: Item) => void;
  onSellNewItem: () => void;
  onEditItem: (item: Item) => void;
}

export function UserProfile({
  user,
  userItems,
  favoriteItems,
  onItemClick,
  onSellNewItem,
  onEditItem,
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('selling');

  const stats = {
    totalListings: userItems.length,
    totalViews: userItems.reduce((sum, item) => sum + Math.floor(Math.random() * 50) + 10, 0),
    totalFavorites: favoriteItems.length,
    averageRating: 4.8,
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2)
    : '';
  const avatarFallback = userInitials || 'YU';
  const profileName = user?.name ?? 'Your Profile';
  const profileEmail = user?.email ?? null;
  const memberSinceText = 'Member since September 2024';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.picture ?? undefined} alt={profileName} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1>{profileName}</h1>
                  {profileEmail && (
                    <p className="text-muted-foreground">{profileEmail}</p>
                  )}
                  <p className="text-muted-foreground">{memberSinceText}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm">⭐ {stats.averageRating}</span>
                    <span className="text-xs text-muted-foreground">(Based on {Math.floor(Math.random() * 20) + 5} reviews)</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button onClick={onSellNewItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Sell Item
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-primary">{stats.totalListings}</div>
            <p className="text-sm text-muted-foreground">Active Listings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-primary">{stats.totalViews}</div>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-primary">{stats.totalFavorites}</div>
            <p className="text-sm text-muted-foreground">Favorites</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-primary">{Math.floor(Math.random() * 10) + 1}</div>
            <p className="text-sm text-muted-foreground">Messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="selling">My Listings ({userItems.length})</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({favoriteItems.length})</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="selling" className="mt-6">
          {userItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground mb-4">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't listed any items yet.</p>
                  <p>Start selling items you no longer need!</p>
                </div>
                <Button onClick={onSellNewItem}>
                  List Your First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userItems.map((item) => (
                <div key={item.id} className="relative">
                  <ItemCard
                    item={item}
                    onItemClick={onItemClick}
                    onFavoriteToggle={() => {}}
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      {Math.floor(Math.random() * 50) + 10}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-12 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem(item);
                    }}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          {favoriteItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No favorite items yet.</p>
                  <p>Browse items and add them to your favorites!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onItemClick={onItemClick}
                  onFavoriteToggle={() => {}}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet.</p>
                <p>When buyers contact you about your items, conversations will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}