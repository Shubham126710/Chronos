"use client";

import React, { useEffect, useState } from "react";
import { Link2, Unlink, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllIntegrations } from "../../../lib/integrations/config";

export default function IntegrationsPage() {
  const queryClient = useQueryClient();

  const { data: integrationsResponse, isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const res = await fetch("/api/integrations");
      if (!res.ok) throw new Error("Failed to fetch integrations");
      const json = await res.json();
      return json.data || [];
    }
  });

  const availableIntegrations = getAllIntegrations();

  const handleConnect = (providerId: string) => {
    window.location.href = `/api/integrations/${providerId}/auth`;
  };

  const handleDisconnect = async (providerId: string) => {
    try {
      await fetch(`/api/integrations?provider=${providerId}`, {
        method: "DELETE"
      });
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase font-mono mb-2">Integrations & Services</h1>
        <p className="text-sm text-foreground/50">Connect third-party services to enhance Chronos AI automation and data aggregation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {availableIntegrations.map((provider) => {
          const dbInt = integrationsResponse?.find((i: any) => i.provider === provider.id);
          const isConnected = dbInt?.status === "Connected";
          const isError = dbInt?.status === "Error" || dbInt?.status === "Reconnect";

          return (
            <motion.div 
              key={provider.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-foreground/5 border border-border p-6 rounded-2xl flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center p-2 shrink-0">
                    <img src={provider.icon} alt={provider.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{provider.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : isError ? 'bg-red-500' : 'bg-foreground/30'}`} />
                      <span className="text-xs uppercase tracking-widest font-mono text-foreground/50">
                        {dbInt ? dbInt.status : 'Not Connected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-foreground/70 leading-relaxed mb-6">
                {provider.description}
              </p>
              
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                {isConnected ? (
                  <button 
                    onClick={() => handleDisconnect(provider.id)}
                    className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    <Unlink className="w-3.5 h-3.5" /> Disconnect
                  </button>
                ) : (
                  <button 
                    onClick={() => handleConnect(provider.id)}
                    className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                      isError 
                        ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                        : 'bg-foreground text-background hover:scale-[1.02]'
                    }`}
                  >
                    {isError ? <RefreshCw className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />} 
                    {isError ? "Reconnect" : "Connect"}
                  </button>
                )}
                
                {isError && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Action required</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
