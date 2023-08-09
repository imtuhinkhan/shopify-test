import React, { useState } from "react";
import {
  Card,
  TextContainer,
  Text,
  List,
  DisplayText,
  Toast,
  Button
} from "@shopify/polaris";
import { useTranslation } from "react-i18next";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function ProductsCard() {
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const fetch = useAuthenticatedFetch();
  const { t } = useTranslation();
  const productsCount = 5;

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/products/count",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  const {
    data: productsData,
    isLoading: isLoadingProducts,
  } = useAppQuery({
    url: "/api/products",
    reactQueryOptions: {
      // Handle loading state if needed
    },
  });
  console.log("Products Data:", productsData);
  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const handlePopulate = async () => {
    setIsLoading(true);
    const response = await fetch("/api/products/create");

    if (response.ok) {
      await refetchProductCount();
      setToastProps({
        content: t("ProductsCard.productsCreatedToast", {
          count: productsCount,
        }),
      });
    } else {
      setIsLoading(false);
      setToastProps({
        content: t("ProductsCard.errorCreatingProductsToast"),
        error: true,
      });
    }
  };

  return (
    <>
      {toastMarkup}
      <Card
        title={t("ProductsCard.title")}
        sectioned
        primaryFooterAction={{
          content: t("ProductsCard.populateProductsButton", {
            count: productsCount,
          }),
          onAction: handlePopulate,
          loading: isLoading,
        }}
      >
        <TextContainer spacing="loose">
          <p>{t("ProductsCard.description")}</p>
          <Text as="h4" variant="headingMd">
            {t("ProductsCard.totalProductsHeading")}
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              {isLoadingCount ? "-" : data?.count} {/* Added safe navigation */}
            </Text>
          </Text>
        </TextContainer>
        {isLoadingProducts ? (
          <p>Loading products...</p>
        ) : (
          productsData && productsData.data.length > 0 ? ( // Check if productsData exists
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {productsData.data.map((product) => (
            <Card key={product.id}>
              <div style={{ padding: "1rem" }}>
                <img
                  src={product.image?.src} // Replace with the actual image source
                  alt={product.title}
                  style={{ maxWidth: "100%", marginBottom: "0.5rem" }}
                />
                <DisplayText size="medium">{product.title}</DisplayText>
                <Button primary onClick={() => handleShowDetails(product)}>
                  Show Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
          ) : (
            <p>No products available.</p>
          )
        )}
      </Card>
    </>
  );
}
