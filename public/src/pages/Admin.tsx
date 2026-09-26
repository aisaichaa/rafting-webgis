import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CitiesManager } from '@/components/admin/CitiesManager';
import { DestinationsManager } from '@/components/admin/DestinationsManager';

const Admin = () => {
  useEffect(() => {
    document.title = "Admin Dashboard - RaftingPro";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage cities and destinations</p>
        </div>

        <Tabs defaultValue="cities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
          </TabsList>

          <TabsContent value="cities">
            <Card>
              <CardHeader>
                <CardTitle>Cities Management</CardTitle>
                <CardDescription>
                  Manage cities and their optional rafting routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CitiesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destinations">
            <Card>
              <CardHeader>
                <CardTitle>Destinations Management</CardTitle>
                <CardDescription>
                  Manage destinations within cities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DestinationsManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
