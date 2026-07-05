# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /source

# Copy everything and restore
COPY . .
RUN dotnet restore FoodRMS.Api.csproj

# Build and publish
RUN dotnet publish FoodRMS.Api.csproj -c Release -o /app

# Run stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app
COPY --from=build /app .
ENV RUNNING_IN_DOCKER=true
ENV ASPNETCORE_URLS=http://0.0.0.0:5109
EXPOSE 5109
ENTRYPOINT ["dotnet", "FoodRMS.Api.dll"]
