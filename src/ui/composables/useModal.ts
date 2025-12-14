import { ref, type Ref } from 'vue';

export interface ModalProps {
	[key: string]: any;
}

export interface ModalState {
	component: any;
	props: ModalProps;
	resolve?: (value: any) => void;
	reject?: (reason?: any) => void;
}

/**
 * Composable для управления модальными окнами
 * Поддерживает открытие/закрытие модалок с передачей props и получения результата
 */
export function useModal() {
	const isOpen = ref(false);
	const currentModal: Ref<ModalState | null> = ref(null);

	/**
   * Открыть модальное окно
   */
	function open<T = any>(component: any, props: ModalProps = {}): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			currentModal.value = {
				component,
				props,
				resolve,
				reject,
			};
			isOpen.value = true;
		});
	}

	/**
   * Закрыть модальное окно с результатом
   */
	function close(result?: any): void {
		if (currentModal.value?.resolve) {
			currentModal.value.resolve(result);
		}
		currentModal.value = null;
		isOpen.value = false;
	}

	/**
   * Закрыть модальное окно с ошибкой
   */
	function cancel(reason?: any): void {
		if (currentModal.value?.reject) {
			currentModal.value.reject(reason);
		}
		currentModal.value = null;
		isOpen.value = false;
	}

	return {
		isOpen,
		currentModal,
		open,
		close,
		cancel,
	};
}

