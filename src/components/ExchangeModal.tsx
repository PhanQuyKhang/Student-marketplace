import { useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Item } from "./ItemCard";

interface ExchangeModalProps {
  targetItem: Item;
  userItems: Item[];
  onClose: () => void;
  onConfirmExchange: (selectedItem: Item, targetItem: Item) => void;
}

export function ExchangeModal({ 
  targetItem, 
  userItems, 
  onClose, 
  onConfirmExchange 
}: ExchangeModalProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleConfirm = () => {
    if (selectedItem) {
      onConfirmExchange(selectedItem, targetItem);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Exchange Items</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Target Item */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">
              You want to exchange for:
            </h3>
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={targetItem.images[0]}
                  alt={targetItem.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{targetItem.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {targetItem.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {targetItem.condition}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Your Items */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">
              Choose one of your items to exchange:
            </h3>
            <div className="space-y-2">
              {userItems.map((item) => (
                <Card 
                  key={item.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedItem?.id === item.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={item.images[0]}
                      alt={item.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.condition}
                        </Badge>
                      </div>
                    </div>
                    {selectedItem?.id === item.id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedItem}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Propose Exchange
          </Button>
        </div>
      </Card>
    </div>
  );
}
