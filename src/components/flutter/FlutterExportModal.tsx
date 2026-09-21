import React, { useState } from 'react';
import { X, Copy, Check, Code2, Folder, FileCode, Download } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const FlutterExportModal: React.FC = () => {
  const { isFlutterModalOpen, setIsFlutterModalOpen, showToast } = useShop();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('pubspec.yaml');

  if (!isFlutterModalOpen) return null;

  const flutterFiles: Record<string, { label: string; code: string; desc: string }> = {
    'pubspec.yaml': {
      label: 'pubspec.yaml',
      desc: 'Flutter Dependencies & Package Manifest',
      code: `name: kukapi_storefront
description: "Production Mobile Shopping App for KUKAPI Shopify Store"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  # State Management & Architecture
  flutter_bloc: ^8.1.3
  get_it: ^7.6.0
  equatable: ^2.0.5

  # Network & Shopify GraphQL
  graphql_flutter: ^5.1.2
  dio: ^5.4.0
  http: ^1.2.0

  # Storage & Security
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.2

  # UI, Icons & Animations
  google_fonts: ^6.1.0
  cached_network_image: ^3.3.1
  flutter_staggered_grid_view: ^0.7.0
  flutter_svg: ^2.0.9
  lottie: ^3.1.0

  # Notifications & Payments
  firebase_core: ^2.27.0
  firebase_messaging: ^14.7.19
  url_launcher: ^6.2.4

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/icons/`,
    },
    'lib/main.dart': {
      label: 'lib/main.dart',
      desc: 'Application Entry Point & Service Dependency Injection',
      code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/theme/app_theme.dart';
import 'core/network/shopify_graphql_client.dart';
import 'features/home/presentation/screens/main_navigation_screen.dart';
import 'features/cart/bloc/cart_bloc.dart';
import 'features/checkout/bloc/checkout_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Edge to edge mobile immersive experience
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  await ShopifyGraphQLClient.init(
    storefrontUrl: const String.fromEnvironment('SHOPIFY_STORE_URL', defaultValue: 'kukapi.myshopify.com'),
    storefrontToken: const String.fromEnvironment('SHOPIFY_STOREFRONT_TOKEN', defaultValue: ''),
  );

  runApp(const KukapiApp());
}

class KukapiApp extends StatelessWidget {
  const KukapiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<CartBloc>(create: (_) => CartBloc()),
        BlocProvider<CheckoutBloc>(create: (_) => CheckoutBloc()),
      ],
      child: MaterialApp(
        title: 'KUKAPI',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const MainNavigationScreen(),
      ),
    );
  }
}`,
    },
    'lib/services/shopify_service.dart': {
      label: 'lib/services/shopify_service.dart',
      desc: 'GraphQL Storefront API Client (Zero Admin Key Exposure)',
      code: `import 'package:graphql_flutter/graphql_flutter.dart';
import '../models/product_model.dart';

class ShopifyService {
  final GraphQLClient client;

  ShopifyService({required this.client});

  static const String fetchProductsQuery = r'''
    query GetProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                  }
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  ''';

  Future<List<ProductModel>> getProducts({int first = 20}) async {
    final QueryResult result = await client.query(
      QueryOptions(
        document: gql(fetchProductsQuery),
        variables: {'first': first},
        fetchPolicy: FetchPolicy.cacheAndNetwork,
      ),
    );

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    final edges = result.data?['products']?['edges'] as List<dynamic>? ?? [];
    return edges.map((e) => ProductModel.fromShopifyJson(e['node'])).toList();
  }
}`,
    },
    'lib/features/checkout/cod_calculator.dart': {
      label: 'lib/features/checkout/cod_calculator.dart',
      desc: 'Configurable COD & Advance Payment Math Model',
      code: `enum PaymentMode {
  online,
  fullCod,
  partialCodAdvance,
}

class CodBreakdown {
  final double totalAmount;
  final double payableNow;
  final double remainingCod;
  final double codFee;

  CodBreakdown({
    required this.totalAmount,
    required this.payableNow,
    required this.remainingCod,
    required this.codFee,
  });

  factory CodBreakdown.calculate({
    required double cartSubtotal,
    required double discount,
    required double shippingFee,
    required double codFeeConfig,
    required double codAdvanceConfig,
    required PaymentMode mode,
  }) {
    final baseTotal = cartSubtotal - discount + shippingFee;
    
    switch (mode) {
      case PaymentMode.online:
        return CodBreakdown(
          totalAmount: baseTotal,
          payableNow: baseTotal,
          remainingCod: 0.0,
          codFee: 0.0,
        );
      case PaymentMode.fullCod:
        final fullTotal = baseTotal + codFeeConfig;
        return CodBreakdown(
          totalAmount: fullTotal,
          payableNow: 0.0,
          remainingCod: fullTotal,
          codFee: codFeeConfig,
        );
      case PaymentMode.partialCodAdvance:
        final fullTotal = baseTotal + codFeeConfig;
        final advance = codAdvanceConfig > fullTotal ? fullTotal : codAdvanceConfig;
        return CodBreakdown(
          totalAmount: fullTotal,
          payableNow: advance,
          remainingCod: fullTotal - advance,
          codFee: codFeeConfig,
        );
    }
  }
}`,
    },
  };

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedKey(key);
    showToast(`Copied ${key} to clipboard!`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-zinc-950 text-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm text-white">
                Flutter & Dart Architecture
              </h3>
              <span className="text-[10px] text-zinc-400">
                Production-ready code structure for Android & iOS
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsFlutterModalOpen(false)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs Strip */}
        <div className="flex items-center gap-1 p-2 bg-zinc-900/60 border-b border-zinc-800 overflow-x-auto no-scrollbar">
          {Object.keys(flutterFiles).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setSelectedFile(fileName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                selectedFile === fileName
                  ? 'bg-zinc-800 text-white border border-zinc-700 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>{flutterFiles[fileName].label}</span>
            </button>
          ))}
        </div>

        {/* File Sub-header with copy button */}
        <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/60 flex items-center justify-between text-xs">
          <span className="text-zinc-400">{flutterFiles[selectedFile].desc}</span>
          <button
            onClick={() => handleCopy(flutterFiles[selectedFile].code, selectedFile)}
            className="flex items-center gap-1 text-[11px] font-bold text-zinc-300 hover:text-white bg-zinc-800 px-2.5 py-1 rounded-md"
          >
            {copiedKey === selectedFile ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-300 bg-zinc-950">
          <pre className="whitespace-pre overflow-x-auto selection:bg-cyan-500/30">
            {flutterFiles[selectedFile].code}
          </pre>
        </div>

        {/* Build instructions footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Run: <code className="text-cyan-400 font-mono">flutter pub get && flutter run</code></span>
          <span className="text-[10px] text-zinc-500">Android SDK 34 · iOS 16+ · Web</span>
        </div>
      </div>
    </div>
  );
};
