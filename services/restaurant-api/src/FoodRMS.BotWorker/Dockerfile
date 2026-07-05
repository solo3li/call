FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /source

COPY FoodRMS.BotWorker.csproj .
RUN dotnet restore FoodRMS.BotWorker.csproj

COPY . .
RUN dotnet publish FoodRMS.BotWorker.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "FoodRMS.BotWorker.dll"]
