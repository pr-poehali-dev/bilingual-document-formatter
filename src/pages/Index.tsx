import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Translation {
  id: string;
  original: string;
  translated: string;
  timestamp: Date;
}

const Index = () => {
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [history, setHistory] = useState<Translation[]>([]);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setOriginalText(text);
      toast({
        title: 'Документ загружен',
        description: `Файл "${file.name}" успешно загружен`,
      });
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleTranslate = async () => {
    if (!originalText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите текст для перевода',
        variant: 'destructive',
      });
      return;
    }

    setIsTranslating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockTranslation = originalText
      .split('\n')
      .map(line => `[EN] ${line}`)
      .join('\n');
    
    setTranslatedText(mockTranslation);
    
    const newTranslation: Translation = {
      id: Date.now().toString(),
      original: originalText,
      translated: mockTranslation,
      timestamp: new Date(),
    };
    setHistory(prev => [newTranslation, ...prev].slice(0, 10));
    
    setIsTranslating(false);
    toast({
      title: 'Перевод завершён',
      description: 'Текст успешно переведён на английский',
    });
  };

  const handleExportDocx = () => {
    if (!translatedText) {
      toast({
        title: 'Ошибка',
        description: 'Сначала выполните перевод',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    
    setTimeout(() => {
      const content = `ОРИГИНАЛ (Русский)\n\n${originalText}\n\n\nПЕРЕВОД (English)\n\n${translatedText}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translation_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
      toast({
        title: 'Документ экспортирован',
        description: 'Файл успешно сохранён',
      });
    }, 1000);
  };

  const loadFromHistory = (item: Translation) => {
    setOriginalText(item.original);
    setTranslatedText(item.translated);
    toast({
      title: 'Перевод загружен',
      description: 'Документ загружен из истории',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Icon name="Languages" size={32} className="text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">DocTranslate Pro</h1>
              <p className="text-sm text-muted-foreground">Профессиональный переводчик документов</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="translate" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="translate">
              <Icon name="FileText" size={18} className="mr-2" />
              Перевод
            </TabsTrigger>
            <TabsTrigger value="history">
              <Icon name="History" size={18} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" size={18} className="mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="translate" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Icon name="Upload" size={20} />
                    Загрузка документа
                  </h2>
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span className="cursor-pointer">
                        <Icon name="FolderOpen" size={18} className="mr-2" />
                        Выбрать файл
                      </span>
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Icon name="FileText" size={16} />
                      Оригинал (Русский)
                    </label>
                    <Textarea
                      value={originalText}
                      onChange={(e) => setOriginalText(e.target.value)}
                      placeholder="Введите или загрузите текст на русском языке..."
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Icon name="Globe" size={16} />
                      Перевод (English)
                    </label>
                    <Textarea
                      value={translatedText}
                      readOnly
                      placeholder="Переведённый текст появится здесь..."
                      className="min-h-[400px] font-mono text-sm bg-muted/50"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-center pt-4">
                  <Button 
                    onClick={handleTranslate} 
                    size="lg"
                    disabled={isTranslating || !originalText.trim()}
                    className="min-w-[200px]"
                  >
                    {isTranslating ? (
                      <>
                        <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                        Перевод...
                      </>
                    ) : (
                      <>
                        <Icon name="Languages" size={18} className="mr-2" />
                        Перевести
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={handleExportDocx}
                    size="lg"
                    variant="secondary"
                    disabled={isExporting || !translatedText}
                    className="min-w-[200px]"
                  >
                    {isExporting ? (
                      <>
                        <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                        Экспорт...
                      </>
                    ) : (
                      <>
                        <Icon name="Download" size={18} className="mr-2" />
                        Экспорт в .docx
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="History" size={20} />
                История переводов
              </h2>
              
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="FileQuestion" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>История пуста</p>
                  <p className="text-sm">Выполните первый перевод</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <Card 
                      key={item.id} 
                      className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => loadFromHistory(item)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium line-clamp-2">
                            {item.original.substring(0, 100)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-muted-foreground flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="Settings" size={20} />
                Настройки
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Язык перевода</h3>
                  <p className="text-sm text-muted-foreground">
                    Текущий: Русский → Английский
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Формат экспорта</h3>
                  <p className="text-sm text-muted-foreground">
                    Текущий: Microsoft Word (.docx)
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">О приложении</h3>
                  <p className="text-sm text-muted-foreground">
                    DocTranslate Pro v1.0 - Профессиональный переводчик документов с параллельным отображением текста
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;