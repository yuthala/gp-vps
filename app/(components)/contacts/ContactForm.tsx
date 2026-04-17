'use client';

import { useState } from 'react';
import Heading from '../../ui/Heading';
import Link from "next/link";
import Button from '../../ui/Button';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Replace with your actual API endpoint
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <div className="max-w-7xl flex flex-col items-center mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <div className="bg-[#F2F9ED]/50 rounded-lg p-6 md:p-8 border border-[#064929]/50">
					<Heading level={3} className="text-xl md:text-2xl font-semibold text-white mb-6">Напишите нам</Heading>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="pt-3 lg:pt-6">
                <label htmlFor="name" className="block text-md font-semibold text-foreground pb-2">
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-white border border-gray-400 p-2 rounded w-full outline-none focus:border-green-500"
                  placeholder="Ваше имя"
                />
              </div>

              <div className="pt-3 lg:pt-6">
                <label htmlFor="email" className="block text-md font-semibold text-foreground pb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white border border-gray-400 p-2 rounded w-full outline-none focus:border-green-500"
                  placeholder="Ваш адрес электронной почты"
                />
              </div>

              <div className="pt-3 lg:pt-6">
                <label htmlFor="message" className="block text-md font-semibold text-foreground pb-2">
                  Сообщение
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  style={{ height: '180px' }}
                  className="bg-white border border-gray-400 p-2 rounded w-full mt-4 h-32 resize-none outline-none focus:border-green-500"
                  placeholder="Ваше сообщение"
                />
              </div>

							<div className="pt-4 sm:pt-8">
								<Button
									type="submit"
									disabled={isSubmitting}
									height={58}
									color="#064929"
									backgroundColor="#D3D34F"
									borderColor="#064929"
									className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-2xl sm:text-[24px] font-bold uppercase"
								>
									{isSubmitting ? 'Отправка...' : 'Отправить'}
								</Button>

								{submitStatus === 'success' && (
									<p className="text-green-300 text-sm text-center mt-3">
										Сообщение успешно отправлено!
									</p>
								)}

								{submitStatus === 'error' && (
									<p className="text-red-300 text-sm text-center mt-3">
										Ошибка при отправке. Пожалуйста, попробуйте позже.
									</p>
								)}
							</div>

							<div className="pt-4 sm:pt-8 text-foreground text-sm">
								Нажимая на кнопку <span className="font-bold">&quot;Отправить&quot;</span>, вы соглашаетесь с 
								<Link href="/pdf/policy.pdf" className="text-green-600 underline" target="_blank">&nbsp; Политикой обработки персональных данных</Link>.&nbsp; 
								<div className="flex pt-3">
									<label className="inline-flex gap-1 pr-2 pt-1.25">
										<input type="checkbox" defaultChecked={false} className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
									</label> 
									<div>
										<span className="text-foreground">Подтверждаю свое</span>
										<Link href="/pdf/agreement_pd.pdf" className="text-green-600 underline" target="_blank">&nbsp;&nbsp;Cогласие на обработку персональных данных</Link>.
									</div>
								</div>
							</div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
