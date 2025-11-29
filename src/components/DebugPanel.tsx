import { useState } from 'react';
import { Bug, X, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useDebug } from '@/contexts/DebugContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const DebugPanel = () => {
  const { debugMode, apiLogs, clearLogs } = useDebug();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Show popup when new logs arrive in debug mode
  const toggleExpanded = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-500';
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 400 && status < 500) return 'bg-yellow-500';
    if (status >= 500) return 'bg-red-500';
    return 'bg-blue-500';
  };

  if (!debugMode) return null;

  return (
    <>
      {/* Floating Debug Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="default"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <Bug className="h-5 w-5" />
        </Button>
        {apiLogs.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
          >
            {apiLogs.length}
          </Badge>
        )}
      </div>

      {/* Debug Panel Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  API Debug Panel
                </DialogTitle>
                <DialogDescription>
                  {apiLogs.length} API calls logged
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
                disabled={apiLogs.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-2 py-4">
              {apiLogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No API calls yet. Make some requests to see them here.
                </div>
              ) : (
                apiLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg overflow-hidden bg-card"
                  >
                    <div
                      className="flex items-center gap-2 p-3 cursor-pointer hover:bg-accent"
                      onClick={() => toggleExpanded(log.id)}
                    >
                      {expandedLogs.has(log.id) ? (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      )}
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(log.status)} text-white`}
                      >
                        {log.status || 'ERR'}
                      </Badge>
                      <Badge variant="secondary">{log.method}</Badge>
                      <span className="text-sm font-mono flex-1 truncate">
                        {log.url}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    {expandedLogs.has(log.id) && (
                      <div className="border-t bg-muted/50 p-3 space-y-3">
                        {log.requestData && (
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground mb-1">
                              REQUEST:
                            </div>
                            <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.requestData, null, 2)}
                            </pre>
                          </div>
                        )}

                        {log.responseData && (
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground mb-1">
                              RESPONSE:
                            </div>
                            <pre className="text-xs bg-background p-2 rounded overflow-x-auto max-h-96">
                              {JSON.stringify(log.responseData, null, 2)}
                            </pre>
                          </div>
                        )}

                        {log.error && (
                          <div>
                            <div className="text-xs font-semibold text-destructive mb-1">
                              ERROR:
                            </div>
                            <pre className="text-xs bg-destructive/10 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.error, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

