import { ArrowLeft, Heart, Share2, MapPin, Clock, Star, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Item } from "./ItemCard";

interface ItemDetailProps {
  item: Item;
  onBack: () => void;
  onContact: (item: Item) => void;
  onExchange?: (item: Item) => void;
  userItems?: Item[];
}

export function ItemDetail({ item, onBack, onContact, onExchange, userItems }: ItemDetailProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg">
            <ImageWithFallback
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          {item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded border">
                  <ImageWithFallback
                    src={image}
                    alt={`${item.title} ${index + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-semibold">{item.title}</h1>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Posted {item.timePosted}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{item.category}</Badge>
              <Badge variant="outline">{item.condition}</Badge>
            </div>

            <div className="text-lg text-muted-foreground mb-6">
              Available for exchange
            </div>
          </div>

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={item.seller.avatar} alt={item.seller.name} />
                    <AvatarFallback>{item.seller.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{item.seller.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        {item.seller.rating.toFixed(1)} rating
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  className="w-full gap-2"
                  onClick={() => onContact(item)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact Seller
                </Button>
                {onExchange && userItems && userItems.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => onExchange(item)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Exchange
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="mb-3">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Safety Tips */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Safety Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Meet in a public place on campus</li>
                <li>• Inspect the item before purchasing</li>
                <li>• Use secure payment methods</li>
                <li>• Trust your instincts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}