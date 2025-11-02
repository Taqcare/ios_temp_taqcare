
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TipCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

const TipCard: React.FC<TipCardProps> = ({
  title,
  description,
  icon,
  actionText = "Saiba Mais",
  onAction
}) => {
  // Função para processar o texto e converter \n em elementos <br />
  const formatDescription = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm whitespace-pre-line">
          {formatDescription(description)}
        </CardDescription>
      </CardContent>
      {onAction && (
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" onClick={onAction}>
            {actionText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TipCard;
