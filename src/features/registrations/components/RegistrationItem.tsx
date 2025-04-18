import { Registration } from '../types';
import { formatDate, formatTime } from '@/utils/formatDate';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import { cc } from '@/styles/shared.ts';

// ... existing code ...
            </span>
          </div>
          <div className={cc.listItem.action()}>
            <span className={cc.badge({ color: 'green' })}>
              {registration.status === 'confirmed' && <CheckCircleIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />}
              {registration.status === 'pending' && <ClockIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />}
              {registration.status === 'cancelled' && <MinusCircleIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 