'use client';

import { useState } from 'react';

interface YandexRequestInfoProps {
  orderId: string;
  requestId: string;
  initialInfo?: unknown;
  cancellationStatus?: string | null;
  className?: string;
}

function getStatusFromValue(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  for (const key of ['code', 'name', 'value', 'status']) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
  }
  return null;
}

interface DeliveryStatus {
  code: string;
  description: string | null;
}

function getStatusEntry(value: unknown): DeliveryStatus | null {
  if (typeof value === 'string' && value.trim()) {
    return { code: value, description: null };
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  for (const key of ['status', 'request_status', 'delivery_status', 'state']) {
    const statusValue = record[key];
    const code = getStatusFromValue(statusValue);
    if (code) {
      const nestedDescription =
        typeof statusValue === 'object' && statusValue !== null && !Array.isArray(statusValue)
          ? (statusValue as Record<string, unknown>).description
          : null;
      const description = record.description ?? nestedDescription;
      return {
        code,
        description:
          typeof description === 'string' && description.trim() ? description.trim() : null,
      };
    }
  }

  return null;
}

function getDeliveryStatus(value: unknown): DeliveryStatus | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const containers = [record];

  for (const key of ['request', 'delivery', 'order']) {
    const nested = record[key];
    if (typeof nested === 'object' && nested !== null && !Array.isArray(nested)) {
      containers.push(nested as Record<string, unknown>);
    }
  }

  for (const container of containers) {
    const history = container.state_history;
    if (!Array.isArray(history)) continue;
    for (let index = history.length - 1; index >= 0; index -= 1) {
      const latestStatus = getStatusEntry(history[index]);
      if (latestStatus) return latestStatus;
    }
  }

  for (const container of containers) {
    const status = getStatusEntry(container);
    if (status) return status;
  }

  return null;
}

export default function YandexRequestInfo({
  orderId,
  requestId,
  initialInfo,
  cancellationStatus,
  className,
}: YandexRequestInfoProps) {
  const [info, setInfo] = useState<unknown>(initialInfo ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const yandexStatus = getDeliveryStatus(info);
  const yandexStatusCode = yandexStatus?.code.toUpperCase() ?? '';
  const isCancelled =
    cancellationStatus === 'SUCCESS' ||
    yandexStatusCode.includes('CANCEL');
  let displayedStatus = yandexStatus?.code;
  if (yandexStatusCode === 'CANCELLED') {
    displayedStatus = 'Отменено';
  } else if (isCancelled) {
    displayedStatus = 'Отменена';
  }

  const fetchInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/yandex-info`, {
        method: 'POST',
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof body === 'object' &&
          body !== null &&
          'error' in body &&
          typeof body.error === 'string'
            ? body.error
            : 'Не удалось получить данные Яндекс.Доставки.';
        throw new Error(message);
      }
      if (typeof body !== 'object' || body === null || !('info' in body)) {
        throw new Error('Сервер вернул некорректный ответ.');
      }

      setInfo(body.info);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не удалось получить данные Яндекс.Доставки.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className ?? 'mt-4'}>
      <button
        type="button"
        onClick={fetchInfo}
        disabled={isLoading}
        aria-label="Обновить статус доставки из Яндекс.Доставки"
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
      >
        {isLoading ? 'Запрашиваем...' : info ? 'Обновить' : 'Запросить статус'}
      </button>
      <p className="mt-2 text-sm">
        <span className="font-medium">Статус доставки: </span>
        <span>
          {isCancelled
            ? displayedStatus
            : displayedStatus ?? (info ? 'Не указан в ответе Яндекса' : 'Не запрошен')}
        </span>
      </p>
      {yandexStatus?.description && (
        <p className="mt-1 text-sm">
          <span className="font-medium">Описание: </span>
          {yandexStatus.description}
        </p>
      )}
      <p className="mt-1 break-all text-xs text-gray-500">ID заявки Яндекс: {requestId}</p>
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
