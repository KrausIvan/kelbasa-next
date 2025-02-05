"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, CircularProgress, IconButton } from "@mui/material";
import { useSession } from "next-auth/react"; // nebo tvůj vlastní hook z auth.js
import { signOut } from "next-auth/react"; // uprav cestu, pokud máš vlastní signOut
import Link from "next/link";
import LogoutSharpIcon from '@mui/icons-material/LogoutSharp';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session } = useSession(); // získej session (přihlášeného uživatele)

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#121212" }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: "#1f1f1f" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#ffffff" }}>
            <Link href="/admin/dashboard" passHref>
                Admin Dashboard
            </Link>
          </Typography>
          {session?.user ? (
            <>
              <Typography variant="body1" sx={{ mr: 2, color: "#ffffff" }}>
                {session.user.name || session.user.email}
              </Typography>
              <IconButton onClick={async () => signOut({ redirectTo: "/" })} sx={{ borderColor: "#ffffff", color: "#ffffff" }}>
                <LogoutSharpIcon />
              </IconButton>
            </>
          ) : (
            <CircularProgress color="inherit" sx={{ height: 30 }} />
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 2, backgroundColor: "#181818", color: "#ffffff" }}>
        {children}
      </Box>
    </Box>
  );
}
